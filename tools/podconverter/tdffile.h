#ifndef TDFFILE_H
#define TDFFILE_H

#include <podfile.h>
#include <QJsonArray>



class TdfFile : public PodFile
{
public:
    TdfFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies() { return deps; }

private:
    QStringList deps;
    QJsonArray objects;
    static int fileTypeId;

};

#endif // TDFFILE_H
