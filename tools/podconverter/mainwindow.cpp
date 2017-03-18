#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QFileDialog>
#include <QTreeView>
#include <QMessageBox>
#include <iostream>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::open()
{
    QString fn = QFileDialog::getOpenFileName(this,"Pod selector", QString(), "Pod archives (*.pod)");
    if (!fn.isEmpty()) {
        pod.setFileName(fn);

        QTreeView* tv = ui->treeView;
        tv->setModel( pod.getArchiveModel());
        //tv->show();
        tv->expandAll();
        tv->resizeColumnToContents(0);
        tv->collapseAll();
        tv->setEditTriggers(QTreeView::NoEditTriggers);

        QObject::connect(tv, &QTreeView::pressed, this, &MainWindow::itemPressed);
    }
}


void MainWindow::quit()
{
    qApp->quit();
}

void MainWindow::extract()
{
    QString dn = QFileDialog::getExistingDirectory(this, "Select a directory to extract pod");
    if (!dn.isEmpty()) {
        pod.extractTo(dn);
    }
}

void MainWindow::itemPressed(const QModelIndex &idx)
{
    if (QApplication::mouseButtons() & Qt::RightButton) {
        QVariant v = idx.data();
        if (v.isValid()) {
            QMessageBox::information(this, v.toString(), v.toString(), QMessageBox::Ok);
        }

    }
}


