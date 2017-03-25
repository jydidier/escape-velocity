#include "navfile.h"
#include <QTextStream>
#include <QStringList>
#include <units.h>
#include <QJsonDocument>

int NavFile::fileTypeId = PodFile::registerLoader("NAV", fileLoader<NavFile>);


NavFile::NavFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data,QIODevice::ReadOnly);

    int numNavPoints = ts.readLine().toInt();

    for(int i = 0; i < numNavPoints; i++ ) {
        QJsonObject obj;

        int type = ts.readLine().toInt();
        obj["type"] = type;

        QStringList sl = ts.readLine().split(',');
        obj["position"] = (QJsonArray()
                << sl[0].toFloat() / DISTANCE_UNIT
                << sl[1].toFloat() / DISTANCE_UNIT
                << sl[2].toFloat() / DISTANCE_UNIT
        );
        obj["description"] = ts.readLine();

        switch(type) {
            case 0:
                readTarget(ts, obj);
                break;
            case 1:
                readTunnel(ts,obj);
                break;
            case 4:
                readTunnelExit(ts,obj);
                break;
            case 5:
                readBoss(ts,obj);
                break;
            case 6:
                readStartingPoint(ts,obj);
                break;
        }

        objects << obj;
    }
}


QByteArray NavFile::convert()
{
    QJsonDocument doc(objects);
    return doc.toJson();
}


void NavFile::readTarget(QTextStream &ts, QJsonObject &obj)
{
    int numTargets = ts.readLine().toInt();
    QJsonArray array;
    for (int i=0; i < numTargets; i++) {
        array << ts.readLine().toInt();
    }
    obj["targets"] = array;
}


void NavFile::readTunnel(QTextStream &ts, QJsonObject &obj)
{
    QString filename = ts.readLine();
    obj["filename"] = filename;
    ts.readLine();
    deps << filename;
}

void NavFile::readTunnelExit(QTextStream &ts, QJsonObject &)
{
    ts.readLine();
    ts.readLine();
}


void NavFile::readBoss(QTextStream &ts, QJsonObject &obj)
{
    obj["boss_index"] = ts.readLine().toInt();
    QString musicFile = ts.readLine();
    obj["music_file"] = musicFile;
    deps << musicFile;
    ts.readLine(); ts.readLine();

    readTarget(ts, obj);
}

void NavFile::readStartingPoint(QTextStream &ts, QJsonObject &obj)
{
    QStringList sl = ts.readLine().split(',');

    obj["rotation"] = (QJsonArray()
                       << sl[0].toFloat() / ANGLE_UNIT
                       << sl[1].toFloat() / ANGLE_UNIT
                       << sl[2].toFloat() / ANGLE_UNIT
    );
}

