#include "levelfile.h"

#include <QTextStream>

LevelFile::LevelFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data, QIODevice::ReadOnly);





}

QByteArray LevelFile::convert()
{

}

const QStringList LevelFile::dependencies()
{

}
