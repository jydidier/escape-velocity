#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QScxmlStateMachine>

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
private:
    Ui::MainWindow *ui;
    QScxmlStateMachine* stateMachine;
};

#endif // MAINWINDOW_H
