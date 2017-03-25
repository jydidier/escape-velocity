#ifndef PALETTEWIDGET_H
#define PALETTEWIDGET_H

#include <QWidget>
#include <QVector>
#include <QRgb>

class PaletteWidget : public QWidget
{
    Q_OBJECT
public:
    explicit PaletteWidget(QWidget *parent = 0);
    void setPalette(QVector<QRgb> p);

protected:
    virtual void paintEvent(QPaintEvent* event);

private:
    QVector<QRgb> palette;

};

#endif // PALETTEWIDGET_H
