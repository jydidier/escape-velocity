#include "actfile.h"

int ActFile::fileTypeId = PodFile::registerLoader("ACT", fileLoader<ActFile>);


ActFile::ActFile(PodArchive &arch, QString path) : PodFile(arch, path), palette()
{
    if (data.size() >= 768) {
        for (int i = 0; i< 256*3 ; i+=3) {
            palette.append(qRgb(data[i], data[i+1], data[i+2]));
        }
    }
}
