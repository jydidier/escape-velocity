#ifndef BINFILE_H
#define BINFILE_H
#include <podfile.h>
#include <podarchive.h>

class BinFile : public PodFile
{
public:
    BinFile(PodArchive& arch, QString path);

    virtual QByteArray convert() { return data; }
    virtual const QStringList dependencies() { return deps; }

private:
    void readAnimation(QDataStream& stream);
    void readModel(QDataStream& stream);

    void skip(QDataStream& stream, int n);

    QStringList deps;

};

#endif // BINFILE_H
