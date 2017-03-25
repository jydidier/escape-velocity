#ifndef TEXFILE_H
#define TEXFILE_H

#include <QByteArray>
#include <QStringList>
#include <podfile.h>
#include <QJsonArray>

class TexFile : public PodFile
{
public:
    TexFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual QStringList dependencies() { return deps; }
    virtual QJsonValue toJson() { return QJsonArray::fromStringList(deps); }

private:
    QStringList deps;

    static int fileTypeId;



};

#endif // TEXFILE_H
