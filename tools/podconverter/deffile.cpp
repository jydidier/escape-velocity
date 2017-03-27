#include "deffile.h"
#include <iostream>
#include <QJsonArray>
#include <QJsonDocument>
#include <units.h>

int DefFile::fileTypeId = PodFile::registerLoader("DEF", fileLoader<DefFile>);


DefFile::DefFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data,QIODevice::ReadOnly);

    int numObjects, numInstances ;

    numObjects = ts.readLine().toInt();

    for (int i=0; i < numObjects; i++) {
        objects << readObject(ts);
    }

    numInstances = ts.readLine().toInt();

    for (int i=0; i < numInstances ; i++) {
        readInstance(ts);
    }
}

QByteArray DefFile::convert()
{
    QJsonDocument doc(objects);
    return doc.toJson(QJsonDocument::Indented);
}


void DefFile::readInstance(QTextStream &ts) {
    QStringList sl = ts.readLine().split(',');
    if (sl.count() != 8) return ;

    QJsonObject obj = objects[sl[0].toInt()].toObject();
    QJsonArray instances ;
    if (! obj["instances"].isUndefined()) {
        instances = obj["instances"].toArray();
    }

    QJsonObject instance;
    instance["strength"] = sl[1].toInt();
    instance["position"] =
            (QJsonArray() << sl[2].toFloat() / DISTANCE_UNIT
                << sl[3].toFloat() / DISTANCE_UNIT
                << sl[4].toFloat() / DISTANCE_UNIT);
    instance["rotation"] =
            (QJsonArray() << sl[5].toInt() / ANGLE_UNIT
                << sl[6].toInt() / ANGLE_UNIT
                << sl[7].toInt() / ANGLE_UNIT
    );
    instances << instance;

    obj["instances"] = instances;

    objects[sl[0].toInt()] = obj;
}

QJsonObject DefFile::readObject(QTextStream &ts)
{
    QString line;
    QStringList sl;
    QJsonObject obj;

    int num_rnd_fire_verts ;
    int num_new_hboxes;


    // handling first line
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 8)
        return QJsonObject();
    obj["logic"] = sl[0].toInt();
    obj["radius"] = sl[2].toFloat() / DISTANCE_UNIT;
    obj["center"] = (QJsonArray() <<  sl[3].toFloat()/DISTANCE_UNIT
            << sl[4].toFloat()/DISTANCE_UNIT << sl[5].toFloat()/DISTANCE_UNIT);
    obj["fullModel"] = sl[6];
    obj["simpleModel"] = sl[7];

    if (!deps.contains(sl[6])) {
        deps << sl[6];
    }

    if (!deps.contains(sl[7])) {
        deps << sl[7];
    }

    // second line
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 5)
        return QJsonObject();
    obj["thrustSpeed"] = sl[0].toInt() / DISTANCE_UNIT;
    obj["rotationSpeed"] = sl[1].toFloat() / ANGLE_UNIT;
    obj["fireSpeed"] = sl[2].toInt()/DISTANCE_UNIT;
    obj["fireStrength"] = sl[3].toInt();
    obj["weapon"] = sl[4].toInt();

    // third line
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 4)
        return QJsonObject();
    obj["showOnBriefing"] = sl[0].toInt() != 0;
    obj["createRandomly"] = sl[1].toInt();
    obj["powerupProbability"] = sl[2].toInt();
    obj["powerup"] = sl[3].toInt();

    // fourth line
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 9)
        return QJsonObject();

    num_rnd_fire_verts = sl[0].toInt();
    QJsonArray fire_verts;

    for (int i = 0; i < ((num_rnd_fire_verts>8)?8:num_rnd_fire_verts) ; i++) {
        fire_verts << sl[i+1].toInt();
    }
    obj["fireVerts"] = fire_verts;

    // fifth significative line
    ts.readLine();
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 17)
        return QJsonObject();
    num_new_hboxes = sl[0].toInt();
    QJsonArray hboxes;
    for (int i=0; i < ((num_new_hboxes>8)?8:num_new_hboxes) ; i++) {
        hboxes << (QJsonArray() << sl[i*2+1].toInt() << sl[i*2+2].toInt());
    }
    obj["hboxes"] = hboxes;

    // sixth and seventh significative lines
    ts.readLine();
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 4)
        return QJsonObject();
    obj["attackDist"] = sl[0].toInt();
    obj["retreatDist"] = sl[1].toInt();
    obj["objectIsBoss"] = sl[2].toInt() !=0;

    obj["description"] = ts.readLine();

    // eighth significative line
    ts.readLine();
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 4)
        return QJsonObject();
    obj["fireSpread"] = sl[0].toInt();
    obj["secWpn"] = sl[1].toInt();
    obj["secWpnDist"] = sl[2].toInt();
    obj["fireVelocity"] = sl[3].toInt() / DISTANCE_UNIT;

    // last lines
    ts.readLine();
    obj["bossFireSfx"] = ts.readLine();
    obj["bossYellSfx"] = ts.readLine();



    return obj;
}
