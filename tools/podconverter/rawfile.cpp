#include "rawfile.h"
#include <cmath>
#include <iostream>

int RawFile::fileTypeId = PodFile::registerLoader("RAW", fileLoader<RawFile>);

RawFile::RawFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    int length = data.size();
    int width = -1, height = -1;


    if (length % 320 == 0) {
        width = 320;
        height = length/320;
    } else {
        int side = sqrt(length);

        if (side * side == length) {
            width = height = side;
        } else {
            if ( length % 256 == 0) {
                width = 256;
                height = length / 256;
            }
        }
    }

    if (width > 0 && height > 0) {
        std::cout << width << "x" << height << ": " << length << std::endl;
        image = QImage(width,height,QImage::Format_Indexed8);
        QVector<QRgb> palette;
        for(int i=0; i < 256; i++) {
            palette.append(qRgb(0,0,0));
        }
        setPalette(palette);

        for (int i=0; i < length; i++) {
            image.setPixel(
                (i % width),
                (i / width),
                (unsigned char)data[i]
            );
        }
    }

}
