#ifndef TEXTUREDIALOG_H
#define TEXTUREDIALOG_H

#include <QDialog>

namespace Ui {
class TextureDialog;
}

class TextureDialog : public QDialog
{
    Q_OBJECT

public:
    explicit TextureDialog(QWidget *parent = 0);
    ~TextureDialog();

private:
    Ui::TextureDialog *ui;
};

#endif // TEXTUREDIALOG_H
