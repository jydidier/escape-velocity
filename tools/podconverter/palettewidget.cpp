#include "palettewidget.h"
#include <QPainter>
#include <QBrush>

PaletteWidget::PaletteWidget(QWidget *parent) : QWidget(parent)
{
    setMinimumSize(256,256);

    for (int i=0; i<256; i++) {
        palette.append(QColor((Qt::GlobalColor)(i%20)).rgb());
    }
}

void PaletteWidget::setPalette(QVector<QRgb> p)
{
    palette.clear();
    palette.append(p);
}

void PaletteWidget::paintEvent(QPaintEvent *event)
{
    QPainter p(this);

    p.setPen(Qt::black);
    int nC = palette.count();
    nC = (nC < 256)?nC:256;

    int x,y;
    for (int i = 0; i < nC; i++) {
        x = i/16;
        y = i%16;
        p.setBrush(QBrush(QColor(palette[i])));
        p.drawRect(x*16, y*16, 16, 16);
    }
}

