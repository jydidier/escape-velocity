#include "podfile.h"

int PodFile::fileTypeId = 0;
QHash<QString,std::function<PodFile*(PodArchive&, QString)> > PodFile::loaders;


PodFile::PodFile(PodArchive &arch, QString path) :
    archive(arch), data(arch.getFile(path))
{

}

QStringList PodFile::getAllDependencies()
{
    QStringList base;





    return base;
}

int PodFile::registerLoader(QString ext, std::function<PodFile *(PodArchive &, QString)> cst)
{
    loaders[ext] = cst;
    return loaders.size();
}
