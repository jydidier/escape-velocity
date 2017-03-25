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
    virtual QStringList dependencies();
    virtual QJsonValue toJson() { return level; }

private:
    QStringList deps;
    QString paletteFile ;
    QJsonObject level;

    static int fileTypeId;

};

#endif // LEVELFILE_H
