#ifndef ACTFILE_H
#define ACTFILE_H

#include <podfile.h>
#include <QVector>
#include <QRgb>

class ActFile : public PodFile
{
public:
    ActFile(PodArchive& arch, QString path);

    virtual QByteArray convert() { return QByteArray(); }

    QVector<QRgb> getPalette() { return palette; }

    void shiftColors(int shift);

private:
    QVector<QRgb> palette;

    static int fileTypeId;

};

#endif // ACTFILE_H
