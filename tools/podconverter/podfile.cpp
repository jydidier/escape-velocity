#include "podfile.h"
#include <iostream>

int PodFile::fileTypeId = 0;


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

    loaders()[ext] = cst;
    //std::cout << "registered loaders: " << loaders->size() << std::endl;

    return loaders().size();
}
