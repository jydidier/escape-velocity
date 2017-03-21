#ifndef PODFILE_H
#define PODFILE_H

#include <podarchive.h>
#include <QByteArray>
#include <QStringList>

#include <functional>



class PodFile
{
public:
    explicit PodFile(PodArchive& arch, QString path);

    virtual QByteArray convert() = 0;
    virtual const QStringList dependencies() {
        return QStringList();
    }

    QStringList getAllDependencies();

    static int registerLoader(QString ext,std::function<PodFile*(PodArchive&, QString)> cst);


protected:
    PodArchive& archive;
    QByteArray data;

private:
    static QHash<QString,std::function<PodFile*(PodArchive&, QString)> > loaders;
    static int fileTypeId;
};

template<typename T>
PodFile* fileLoader(PodArchive& arch, QString path) {
    PodFile* res = new T(arch, path);
    return res;
}


#endif // PODFILE_H
