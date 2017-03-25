#ifndef PALETTEDIALOG_H
#define PALETTEDIALOG_H

#include <QDialog>

namespace Ui {
class PaletteDialog;
}

class PaletteDialog : public QDialog
{
    Q_OBJECT

public:
    explicit PaletteDialog(QVector<QRgb> palette, QWidget *parent = 0);
    ~PaletteDialog();

private:
    Ui::PaletteDialog *ui;
};

#endif // PALETTEDIALOG_H
