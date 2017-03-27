#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <texturedialog.h>
#include <palettedialog.h>

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
#include <rawfile.h>
#include <actfile.h>
#include <levelfile.h>
#include <QFileDialog>
#include <QFileInfo>


MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    settings("VertexSoftware", "podconvertor")
{
    ui->setupUi(this);
    ui->menuEntry->setEnabled(false);
    ui->actionExportLevel->setEnabled(false);
    ui->actionExport->setEnabled(false);
    ui->actionExtractFile->setEnabled(false);

    QObject::connect(ui->treeView, &QTreeView::pressed, this, &MainWindow::itemPressed);
    updateRecentMenu();
}


MainWindow::~MainWindow()
{
    delete ui;
}


void MainWindow::open()
{
    QString fn = QFileDialog::getOpenFileName(this,"Pod selector", QString(), "Pod archives (*.pod)");
    if (!fn.isEmpty()) {
        open(fn);
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
    currentItem = idx;

    QString entry = idx.data(Qt::UserRole + 1).toString();

    if (entry.isEmpty()) {
        ui->menuEntry->setEnabled(false);
        ui->actionExportLevel->setEnabled(false);
        ui->actionExport->setEnabled(false);
        ui->actionExtractFile->setEnabled(false);
    } else {
        QString ext = entry.right(3).toLower();

        ui->menuEntry->setEnabled(true);

        ui->actionExportLevel->setEnabled(ext == "lvl");
        ui->actionExport->setEnabled(true);
        ui->actionExtractFile->setEnabled(true);
    }
}


void MainWindow::extractItem()
{
    if (!currentItem.isValid())
        return;

    QString data = currentItem.data(Qt::UserRole + 1).toString();
    QString ext = data.right(3).toLower();
    QString entry = data;

    data.replace('\\', QDir::separator());
    QFileInfo fi(data);

    QString fn = QFileDialog::getSaveFileName(this, "Select extract place",
        fi.fileName().toLower(), "*."+ext
    );

    if (!fn.isEmpty()) {
        pod.extractFile(entry,fn);
    }
}


void MainWindow::exportItem()
{
    if (!currentItem.isValid())
        return;

    QString data = currentItem.data(Qt::UserRole + 1).toString();
    QString ext = data.right(3).toLower();
    QString entry = data;

    data.replace('\\', QDir::separator());
    QFileInfo fi(data);

    PodFile* podFile = PodFile::load(pod, entry);
    if (podFile == nullptr) {
        extractItem();
        return;
    }

    bool handled = false;

    if (ext == "raw") {
        RawFile rf = *(dynamic_cast<RawFile*>(podFile));

        TextureDialog td(rf,this);
        if (td.exec() == QDialog::Accepted) {
            QString fn = QFileDialog::getSaveFileName(this,
                    QString("Please select a file to save texture"),QString(), QString("Png Image (*.png);; Jpeg Image (*.jpg)"));
            if (!fn.isEmpty()) {
                rf.getImage().save(fn);
            }
        }
        handled = true;
    }

    if (ext == "act") {
        ActFile af = *(dynamic_cast<ActFile*>(podFile));
        PaletteDialog pd(af.getPalette(), this);
        pd.exec();
    }


    if (!handled) {
        QString fn = QFileDialog::getSaveFileName(this,
            "Select where to store conversion", data,
            "JSON (*.json);; File (*."+ext+")"
        );
        if (!fn.isEmpty()) {
            podFile->convertAndExport(fn);
        }
    }


    delete podFile;
}


void MainWindow::exportLevel()
{
    if (!currentItem.isValid())
        return;

    QString data = currentItem.data(Qt::UserRole + 1).toString();
    QString ext = data.right(3).toLower();
    QString entry = data;

    data.replace('\\', QDir::separator());
    QFileInfo fi(data);
    LevelFile* lf = dynamic_cast<LevelFile*>(PodFile::load(pod, entry));

    QString fn = QFileDialog::getExistingDirectory(this,
            QString("Please select a directory to save level"));
    if (!fn.isEmpty()) {
        lf->exportLevel(fn);
    }

    delete lf;
}


void MainWindow::updateRecentMenu()
{
    QStringList sl = settings.value("recent").toStringList();

    ui->menuRecentPods->clear();
    for (QString s : sl) {
        ui->menuRecentPods->addAction(s,
            [s,this]() { this->open(s); }
        );
    }

}


void MainWindow::updateRecentSettings(QString doc)
{
    QStringList sl = settings.value("recent").toStringList();

    if (sl.contains(doc)) {
        sl.removeAll(doc);
    }

    if (sl.count() > 4) {
        sl.takeLast();
    }

    sl.prepend(doc);
    settings.setValue("recent",sl);
}


void MainWindow::open(QString podName)
{
    pod.setFileName(podName);
    updateRecentSettings(podName);
    updateRecentMenu();
    currentItem = QModelIndex();

    QTreeView* tv = ui->treeView;
    tv->setModel( pod.getArchiveModel());
    tv->expandAll();
    tv->resizeColumnToContents(0);
    tv->collapseAll();
    tv->setEditTriggers(QTreeView::NoEditTriggers);
}


