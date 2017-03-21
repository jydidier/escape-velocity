#ifndef RAWFILE_H
#define RAWFILE_H

#include <podfile.h>
#include <podarchive.h>

class RawFile : public PodFile
{
public:
    RawFile(PodArchive& arch, QString path);

    virtual QByteArray convert() { return QByteArray();}
    virtual const QStringList dependencies() { return QStringList();}

private:
    static int fileTypeId;

};

#endif // RAWFILE_H
