#ifndef LEVELFILE_H
#define LEVELFILE_H

#include <podfile.h>
#include <podarchive.h>
#include <QJsonObject>

class LevelFile : public PodFile
{
public:
    LevelFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies();

private:
    QStringList deps;
    QJsonObject level;
};

#endif // LEVELFILE_H
