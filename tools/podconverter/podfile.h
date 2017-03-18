#ifndef PODFILE_H
#define PODFILE_H

#include <podarchive.h>
#include <QByteArray>
#include <QStringList>

class PodFile
{
public:
    explicit PodFile(PodArchive& arch, QString path);

    virtual QByteArray convert() = 0;
    virtual const QStringList dependencies() {
        return QStringList();
    }


protected:
    PodArchive& archive;
    QByteArray data;
};

#endif // PODFILE_H
