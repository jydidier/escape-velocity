#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    stateMachine = QScxmlStateMachine::fromFile("menu.scxml");
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::open()
{

}

void MainWindow::quit()
{
    qApp->quit();
}


