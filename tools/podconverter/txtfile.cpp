#include "txtfile.h"
#include <QTextStream>
#include <QJsonArray>
#include <QJsonDocument>

TxtFile::TxtFile(PodArchive &arch, QString path) : PodFile(arch,path)
{
    QTextStream ts(data, QIODevice::ReadOnly);
    QString line;

    model = ts.readLine();
    texture = ts.readLine();

    briefing["model"] = model;
    briefing["texture"] = texture;

    QJsonArray briefingLines;

    line = ts.readLine();
    while( !ts.atEnd() ) {
        briefingLines << line;
        line = ts.readLine();
    }
    briefing["briefing"] = briefingLines;
}

QByteArray TxtFile::convert()
{
    QJsonDocument doc(briefing);
    return doc.toJson();
}
