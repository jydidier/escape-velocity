#include "tdffile.h"
#include <units.h>
#include <QTextStream>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonDocument>

int TdfFile::fileTypeId = PodFile::registerLoader("TDF", fileLoader<TdfFile>);


TdfFile::TdfFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data, QIODevice::ReadOnly);

    QStringList sl;
    int numTunnels = ts.readLine().toInt();

    for(int i=0; i< numTunnels; i++) {
        QJsonObject tunnel;

        QString levelFile;
        levelFile =  ts.readLine();
        deps << levelFile;
        tunnel["level_file"] = levelFile;

        QJsonObject entrance;
        QJsonObject exit;

        sl = ts.readLine().split(',');

        entrance["position"] = (QJsonArray()
                                << sl[0].toFloat() / DISTANCE_UNIT
                                << sl[1].toFloat() / DISTANCE_UNIT
                                << sl[2].toFloat() / DISTANCE_UNIT
        );

        sl = ts.readLine().split(',');

        exit["position"] = (QJsonArray()
                                << sl[0].toFloat() / DISTANCE_UNIT
                                << sl[1].toFloat() / DISTANCE_UNIT
                                << sl[2].toFloat() / DISTANCE_UNIT
        );

        entrance["logic"] = ts.readLine().toInt();
        ts.readLine();

        QString texture = ts.readLine();
        entrance["terrain_texture"] = texture;
        deps << texture;
        exit["logic"] = ts.readLine().toInt();
        ts.readLine();

        texture = ts.readLine();
        exit["terrain_texture"] = texture;
        deps << texture;
        exit["chamber"] = ts.readLine().toInt() != 0;

        tunnel["entrance"] = entrance;
        tunnel["exit"] = exit;

        objects << tunnel;
    }
}


QByteArray TdfFile::convert()
{
    QJsonDocument doc(objects);
    return doc.toJson();
}




