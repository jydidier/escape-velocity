#include "palettedialog.h"
#include "ui_palettedialog.h"


PaletteDialog::PaletteDialog(QVector<QRgb> palette, QWidget *parent) :
    QDialog(parent),
    ui(new Ui::PaletteDialog)
{
    ui->setupUi(this);
    ui->widget->setPalette(palette);
}

PaletteDialog::~PaletteDialog()
{
    delete ui;
}
