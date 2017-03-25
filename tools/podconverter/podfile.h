#ifndef PODFILE_H
#define PODFILE_H

#include <podarchive.h>
#include <QByteArray>
#include <QStringList>

#include <functional>
#include <iostream>
#include <QJsonValue>



class PodFile
{
public:
    explicit PodFile(PodArchive& arch, QString path);
    virtual ~PodFile() {}

    virtual QByteArray convert() = 0;
    virtual QStringList dependencies() {
        return QStringList();
    }
    virtual QJsonValue toJson() { return QJsonValue(); }

    QStringList getAllDependencies();

    static int registerLoader(QString ext,std::function<PodFile*(PodArchive&, QString)> cst);
    PodArchive& getArchive() { return archive; }

    static PodFile* load(PodArchive &arch, QString name);



protected:
    PodArchive& archive;
    QByteArray data;

private:
    static QHash<QString,std::function<PodFile*(PodArchive&, QString)> >& loaders() {
        static QHash<QString,std::function<PodFile*(PodArchive&, QString)> >* res = new  QHash<QString,std::function<PodFile*(PodArchive&, QString)> >();
        return *res;
    }

    static int fileTypeId;
};

template<typename T>
PodFile* fileLoader(PodArchive& arch, QString path) {
    PodFile* res = new T(arch, path);
    return res;
}


#endif // PODFILE_H
