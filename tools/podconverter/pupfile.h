#ifndef PUPFILE_H
#define PUPFILE_H

#include <podfile.h>
#include <QJsonArray>

class PupFile : public PodFile
{
public:
    PupFile(PodArchive& arch, QString path);
    virtual QByteArray convert();

private:
    QJsonArray objects;

};

#endif // PUPFILE_H
