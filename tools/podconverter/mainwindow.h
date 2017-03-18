#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <podarchive.h>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();


private slots:
    void open();
    void quit();
    void extract();
    void itemPressed(const QModelIndex& idx);


private:
    Ui::MainWindow *ui;
    PodArchive pod;
};

#endif // MAINWINDOW_H
