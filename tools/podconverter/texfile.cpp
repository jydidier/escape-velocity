#include "texfile.h"
#include <QTextStream>
#include <QJsonArray>
#include <QJsonDocument>

int TexFile::fileTypeId = PodFile::registerLoader("TEX", fileLoader<TexFile>);


TexFile::TexFile(PodArchive &arch, QString path) : PodFile(arch,path)
{
    QTextStream ts(data,QIODevice::ReadOnly);

    int numTextures = ts.readLine().toInt();

    for(int i=0; i < numTextures; i++) {
        deps << ts.readLine();
    }
}

QByteArray TexFile::convert()
{
    QJsonArray textures = QJsonArray::fromStringList(deps);
    QJsonDocument doc(textures);
    return doc.toJson();
}


