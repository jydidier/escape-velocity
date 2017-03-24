#include "texturedialog.h"
#include "ui_texturedialog.h"
#include <actfile.h>
#include <QPixmap>
#include <QStringList>
#include <iostream>

TextureDialog::TextureDialog(RawFile &file, QWidget *parent) :
    QDialog(parent), file(file),
    ui(new Ui::TextureDialog)
{
    ui->setupUi(this);

    ui->paletteList->clear();
    QStringList paletteNames = file.getArchive().findFiles("*.ACT");
    paletteNames.sort();
    ui->paletteList->addItems(paletteNames);

    QPixmap pmap = QPixmap::fromImage(file.getImage());
    ui->textureWidget->setPixmap(pmap);

}

TextureDialog::~TextureDialog()
{
    delete ui;
}

void TextureDialog::changePalette(QString s)
{
    ActFile af(file.getArchive(),s);
    file.setPalette(af.getPalette());
    QPixmap pmap = QPixmap::fromImage(file.getImage());

    ui->textureWidget->setPixmap(pmap);

}
