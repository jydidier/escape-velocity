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
    obj["bbox_radius"] = sl[2].toFloat() / DISTANCE_UNIT;
    obj["center"] = (QJsonArray() <<  sl[3].toFloat()/DISTANCE_UNIT
            << sl[4].toFloat()/DISTANCE_UNIT << sl[5].toFloat()/DISTANCE_UNIT);
    obj["complex_model"] = sl[6];
    obj["simple_model"] = sl[7];

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
    obj["thrust_speed"] = sl[0].toInt();
    obj["rotation_speed"] = sl[1].toFloat() / ANGLE_UNIT;
    obj["fire_speed"] = sl[2].toInt()/DISTANCE_UNIT;
    obj["fire_strength"] = sl[3].toInt();
    obj["weapon"] = sl[4].toInt();

    // third line
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 4)
        return QJsonObject();
    obj["show_on_briefing"] = sl[0].toInt() != 0;
    obj["create_randomly"] = sl[1].toInt();
    obj["powerup_probability"] = sl[2].toInt();
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
    obj["fire_verts"] = fire_verts;

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
    obj["attack_dist"] = sl[0].toInt();
    obj["retreat_dist"] = sl[1].toInt();
    obj["object_is_boss"] = sl[2].toInt() !=0;

    obj["description"] = ts.readLine();

    // eighth significative line
    ts.readLine();
    line = ts.readLine();
    sl = line.split(',');
    if (sl.count() != 4)
        return QJsonObject();
    obj["fire_spread"] = sl[0].toInt();
    obj["sec_wpn"] = sl[1].toInt();
    obj["sec_wpn_dist"] = sl[2].toInt();
    obj["fire_velocity"] = sl[3].toInt() / DISTANCE_UNIT;

    // last lines
    ts.readLine();
    obj["boss_fire_sfx"] = ts.readLine();
    obj["boss_yell_sfx"] = ts.readLine();



    return obj;
}
