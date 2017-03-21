#ifndef TEXFILE_H
#define TEXFILE_H

#include <QByteArray>
#include <QStringList>
#include <podfile.h>

class TexFile : public PodFile
{
public:
    TexFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies() { return deps; }

private:
    QStringList deps;

    static int fileTypeId;



};

#endif // TEXFILE_H
