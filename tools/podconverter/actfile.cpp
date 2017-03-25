#include "actfile.h"

int ActFile::fileTypeId = PodFile::registerLoader("ACT", fileLoader<ActFile>);


ActFile::ActFile(PodArchive &arch, QString path) : PodFile(arch, path), palette()
{
    if (data.size() >= 768) {
        for (int i = 0; i< 256*3 ; i+=3) {
            QColor color((unsigned char)data[i], (unsigned char)data[i+1], (unsigned char)data[i+2]);
            if (color == Qt::black) {
                color.setAlpha(0);
            }
            palette.append(color.rgba());
        }
    }
}
