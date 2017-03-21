#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QFileDialog>
#include <QTreeView>
#include <QMessageBox>
#include <iostream>
#include <deffile.h>
#include <pupfile.h>
#include <navfile.h>
#include <texfile.h>
#include <binfile.h>
#include <tdffile.h>
#include <txtfile.h>
#include <tnlfile.h>
#include <levelfile.h>

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
        QVariant v = idx.data(Qt::UserRole + 1);
        if (v.isValid()) {
            if (v.toString().endsWith(".DEF")) {
                DefFile df(pod, v.toString());
                std::cout << qPrintable(df.convert()) << std::endl;
            }
            if (v.toString().endsWith(".PUP")) {
                PupFile pf(pod, v.toString());
                std::cout << qPrintable(pf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".NAV")) {
                NavFile nf(pod, v.toString());
                std::cout << qPrintable(nf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".TEX")) {
                TexFile tf(pod, v.toString());
                std::cout << qPrintable(tf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".BIN")) {
                BinFile bf(pod, v.toString());
                std::cout << qPrintable(bf.dependencies().join(',')) << std::endl;
            }
            if (v.toString().endsWith(".TDF")) {
                TdfFile tf(pod, v.toString());
                std::cout << qPrintable(tf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".TXT")) {
                TxtFile tf(pod, v.toString());
                std::cout << qPrintable(tf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".TNL")) {
                TnlFile tf(pod, v.toString());
                std::cout << qPrintable(tf.convert()) << std::endl;
            }
            if (v.toString().endsWith(".LVL")) {
                LevelFile lf(pod, v.toString());
                std::cout << qPrintable(lf.convert()) << std::endl;
            }


        }

    }
}


