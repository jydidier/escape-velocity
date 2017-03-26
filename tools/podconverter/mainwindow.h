#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <podarchive.h>
#include <QSettings>
#include <QModelIndex>

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

    void extractItem();
    void exportItem();
    void exportLevel();



private:
    void updateRecentMenu();
    void updateRecentSettings(QString doc);
    void open(QString podName);


    Ui::MainWindow *ui;
    PodArchive pod;
    QSettings settings;
    QModelIndex currentItem;
};

#endif // MAINWINDOW_H
