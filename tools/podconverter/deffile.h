#ifndef DEFFILE_H
#define DEFFILE_H

#include <podfile.h>
#include <QJsonObject>
#include <QJsonArray>
#include <QTextStream>


class DefFile : public PodFile
{
public:
    DefFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies() { return deps; }

private:
    QJsonObject readObject(QTextStream& ts);
    void readInstance(QTextStream& ts);
    QJsonArray objects;
    QStringList deps;
};

#endif // DEFFILE_H
