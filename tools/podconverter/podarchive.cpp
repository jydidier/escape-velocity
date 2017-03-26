#include "podarchive.h"
#include <iostream>
#include <QIcon>
#include <QDir>
#include <QList>
#include <QRegExp>

PodArchive::PodArchive(QString fileName)
{
    if (!fileName.isEmpty()) {
        setFileName(fileName);
    }

    QStringList cnames ;
    cnames << "name" << "size" << "offset";
    archiveModel.setHorizontalHeaderLabels(cnames);
}


void PodArchive::setFileName(QString fileName) {
    if (file.isOpen())
        file.close();

    file.setFileName(fileName);
    file.open(QFile::ReadOnly);
    decode();
}


void PodArchive::extractTo(QString dirname)
{
    QStandardItem* it = archiveModel.invisibleRootItem();

    QList<QStandardItem*> dirStack;
    dirStack.append(it);

    while (!dirStack.isEmpty()) {
        it = dirStack.takeLast();

        if (it->data().isValid()) {
            QString fn = dirname + QDir::separator() +
                    it->data().toString().replace('\\', QDir::separator());
            QFileInfo fi(fn);
            if (QDir::root().mkpath(fi.absolutePath())) {
                extractFile(it->data().toString(), fn);
                std::cout << qPrintable(fn) << std::endl;
            }
        } else {
            for (int i=0; i < it->rowCount(); i++) {
                dirStack.append(it->child(i));
            }
        }
    }
}


void PodArchive::extractFile(QString entry, QString fileName)
{
    QFile file(fileName);
    if (!file.open(QFile::WriteOnly)) {
        return ;
    }
    file.write(getFile(entry));
    file.close();
}


QStringList PodArchive::findFiles(QString pattern)
{
    QStringList sl = archiveEntries.keys();
    QRegExp re(pattern);
    re.setCaseSensitivity(Qt::CaseInsensitive);
    re.setPatternSyntax(QRegExp::WildcardUnix);
    QStringList res;

    for(QString s : sl) {
        if (re.exactMatch(s))
            res << s;
    }

    return res;
}


QByteArray PodArchive::getFile(QString name)
{
    if (!file.isOpen()) {
        return QByteArray();
    }

    if (!archiveEntries.contains(name)) {
        return QByteArray();
    }

    PodFileEntry fe = archiveEntries[name];
    if (!file.seek(fe.fileoffset)) {
        return QByteArray();
    }

    return file.read(fe.filesize);
}

QByteArray PodArchive::searchFile(QString name)
{
    QStringList sl = archiveEntries.keys();
    name = name.toUpper();

    for (QString s: sl) {
        if (s.endsWith(name)) {
            std::cout << qPrintable(name) << std::endl;
            return getFile(s);
        }
    }
    return QByteArray();
}


void PodArchive::decode() {
    if (!file.isOpen())
        return ;
    PodHeader header;

    qint64 s = file.read((char*)&header, sizeof(header));

    if (s != sizeof(header))
        return ;

    PodFileEntry entries[header.numfiles];
    archiveModel.clear();
    archiveEntries.clear();

    QStringList cnames ;
    cnames << "name" << "size" << "offset";
    archiveModel.setHorizontalHeaderLabels(cnames);

    for (unsigned int i=0; i < header.numfiles; i++) {
        file.read((char*)(&entries[i]), sizeof(PodFileEntry));
        addEntry(entries[i]);
        archiveEntries[entries[i].filepath] = entries[i];
    }
}


void PodArchive::addEntry(const PodArchive::PodFileEntry &entry)
{
    QStandardItem* parentItem = archiveModel.invisibleRootItem();
    QString filePath(entry.filepath);

    QStringList sl = filePath.split('\\');

    QStandardItem* currentItem = parentItem;

    for (QString s : sl)  {
        int idx = -1;
        for (int i=0; i< currentItem->rowCount(); i++ ) {
            if (currentItem->child(i)->text() == s ) {
                idx = i ;
                break;
            }
        }
        // here we are out of loop
        if (idx == -1) {
            QList<QStandardItem*> newItems;
            newItems << new QStandardItem(s);
            if (sl.last() == s) {
                QStandardItem* si1 = new QStandardItem(
                    QString::number(entry.filesize)
                );
                QStandardItem* si2 = new QStandardItem(
                    QString::number(entry.fileoffset)
                );
                si1->setTextAlignment(Qt::AlignRight);
                si2->setTextAlignment(Qt::AlignRight);
                newItems << si1 << si2 ;
                newItems[0]->setIcon(QIcon::fromTheme("text-x-generic"));
                newItems[0]->setData(entry.filepath);
            } else {
                newItems[0]->setIcon(QIcon::fromTheme("folder"));
            }
            currentItem->appendRow(newItems);
            currentItem = newItems[0];
        } else {
            currentItem = currentItem->child(idx);
        }
    }
}

