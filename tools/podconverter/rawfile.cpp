#include "rawfile.h"

int RawFile::fileTypeId = PodFile::registerLoader("RAW", fileLoader<RawFile>);

RawFile::RawFile(PodArchive &arch, QString path) : PodFile(arch, path)
{

}
