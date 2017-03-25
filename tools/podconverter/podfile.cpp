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
    QStringList explored;

    QStringList stack = dependencies();
    while (!stack.empty()) {
        QString fn = stack.takeFirst();
        explored << fn;
        QStringList lst = archive.findFiles("*"+fn);
        if(! lst.empty()) {
            base << lst[0];
            if (! lst[0].isEmpty()) {
                PodFile* file = PodFile::load(archive, lst[0]);
                if (file != nullptr) {
                    QStringList deps = file->dependencies();
                    for (QString d : deps) {
                        if (!stack.contains(d) && !explored.contains(d) )
                            stack.append(d);
                    }
                    delete file;
                }
            }
        }

    }
    return base;
}

int PodFile::registerLoader(QString ext, std::function<PodFile *(PodArchive &, QString)> cst)
{

    loaders()[ext.toLower()] = cst;
    //std::cout << "registered loaders: " << loaders->size() << std::endl;

    return loaders().size();
}

PodFile *PodFile::load(PodArchive &arch,QString name)
{
    QString ext = name.right(3).toLower();
    if (loaders().contains(ext)) {
        return (loaders().value(ext))(arch, name);
    }
    return nullptr; //newPodFile(arch, arch.getFile(name));
}
