#ifndef TXTFILE_H
#define TXTFILE_H

#include <podfile.h>
#include <QJsonObject>

class TxtFile : public PodFile
{
public:
    TxtFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies() { return QStringList() << model << texture; }

private:
    QJsonObject briefing;
    QString model;
    QString texture;

    static int fileTypeId;

};

#endif // TXTFILE_H
