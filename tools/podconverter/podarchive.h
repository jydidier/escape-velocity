#ifndef PODARCHIVE_H
#define PODARCHIVE_H
#include <QFile>
#include <QStandardItem>
#include <QStandardItemModel>
#include <QHash>
#include <QByteArray>



class PodArchive
{
public:
    PodArchive(QString fileName = QString::null);

    void setFileName(QString fileName);
    void extractTo(QString dirname);
    void extractFile(QString entry, QString fileName );

    QStandardItemModel*  getArchiveModel() { return &archiveModel; }
    QByteArray getFile(QString name);
    QByteArray searchFile(QString name);

private:
    typedef struct {
        unsigned int numfiles;
        char id[80];
    } PodHeader;

    typedef struct {
        char filepath[32];
        unsigned int filesize;
        unsigned int fileoffset;
    } PodFileEntry;

    void decode();
    void addEntry(const PodFileEntry& entry);


    QFile file;
    QStandardItemModel archiveModel;
    QHash <QString, PodFileEntry> archiveEntries;


};

#endif // PODARCHIVE_H
