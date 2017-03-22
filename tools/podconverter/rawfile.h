#ifndef RAWFILE_H
#define RAWFILE_H

#include <podfile.h>
#include <podarchive.h>
#include <QImage>
#include <QVector>
#include <QRgb>

class RawFile : public PodFile
{
public:
    RawFile(PodArchive& arch, QString path);

    virtual QByteArray convert() { return QByteArray();}

    QImage getImage() { return image; }
    void setPalette(QVector<QRgb> palette) {
        image.setColorTable(palette);
    }

private:
    QImage image;

    static int fileTypeId;

};

#endif // RAWFILE_H
