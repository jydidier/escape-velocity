#ifndef NAVFILE_H
#define NAVFILE_H

#include <podfile.h>
#include <QJsonArray>
#include <QJsonObject>
#include <QTextStream>


class NavFile : public PodFile
{
public:
    explicit NavFile(PodArchive& arch, QString path);

    virtual QByteArray convert();
    virtual const QStringList dependencies() { return deps; }

private:
    void readTarget(QTextStream& ts, QJsonObject& obj);
    void readTunnel(QTextStream& ts, QJsonObject& obj);
    //QJsonObject readCheckpoint();
    //QJsonObject readDepartureUnit();
    void readTunnelExit(QTextStream& ts, QJsonObject& obj);
    void readBoss(QTextStream& ts, QJsonObject& obj);
    void readStartingPoint(QTextStream& ts, QJsonObject& obj);

    QJsonArray objects;
    QStringList deps;

};

#endif // NAVFILE_H
