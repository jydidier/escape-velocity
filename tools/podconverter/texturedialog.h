#ifndef TEXTUREDIALOG_H
#define TEXTUREDIALOG_H

#include <QDialog>
#include <rawfile.h>

namespace Ui {
class TextureDialog;
}

class TextureDialog : public QDialog
{
    Q_OBJECT

public:
    explicit TextureDialog(RawFile& file, QWidget *parent = 0);
    ~TextureDialog();

private slots:
    void changePalette(QString s);

private:
    Ui::TextureDialog *ui;
    RawFile& file;
};

#endif // TEXTUREDIALOG_H
