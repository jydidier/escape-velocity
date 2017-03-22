#include "texturedialog.h"
#include "ui_texturedialog.h"

TextureDialog::TextureDialog(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::TextureDialog)
{
    ui->setupUi(this);
}

TextureDialog::~TextureDialog()
{
    delete ui;
}
