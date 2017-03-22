#ifndef TNLFILE_H
#define TNLFILE_H

#include <podfile.h>
#include <QJsonArray>

class TnlFile : public PodFile
{
public:
    TnlFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    //virtual const QStringList dependencies();

private:
    QJsonArray segments;

    static int fileTypeId;


};

#endif // TNLFILE_H
