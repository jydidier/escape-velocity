#include "podfile.h"

PodFile::PodFile(PodArchive &arch, QString path) :
    archive(arch), data(arch.getFile(path))
{

}
