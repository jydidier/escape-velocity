#ifndef PUPFILE_H
#define PUPFILE_H

#include <podfile.h>
#include <QJsonArray>

class PupFile : public PodFile
{
public:
    PupFile(PodArchive& arch, QString path);
    virtual QByteArray convert();
    virtual QJsonValue toJson() { return objects; }

private:
    QJsonArray objects;

    static int fileTypeId;


};

#endif // PUPFILE_H
