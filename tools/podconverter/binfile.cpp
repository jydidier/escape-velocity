#include "binfile.h"

#include <QDataStream>
#include <iostream>

int BinFile::fileTypeId = PodFile::registerLoader("BIN", fileLoader<BinFile>);

BinFile::BinFile(PodArchive &arch, QString path) : PodFile(arch, path) {
    QDataStream stream(&data, QIODevice::ReadOnly);
    stream.setByteOrder(QDataStream::LittleEndian);

    int type;
    stream >> type;

    if (type == 0x14) {
        readModel(stream);
    }

    if (type == 0x20) {
        readAnimation(stream);
    }

}


void BinFile::readAnimation(QDataStream &stream)
{
    int numFrames, discard;
    stream >> discard >> numFrames >> discard >> discard >> discard;

    char str[16];
    for(int i=0; i<numFrames ; i++) {
        stream.readRawData(str, 16);
        deps << QString(str);
    }
}


void BinFile::readModel(QDataStream &stream)
{
    int discard, numVertices, blockNumber;
    uint length;

    // processing header
    stream >> discard >> discard >> discard >> numVertices;

    // we are skipping vertices array
    skip(stream, 3 * numVertices);

    do {
        stream >> blockNumber;

        switch(blockNumber) {
            case 0x00 :
            {
                break;
            }
            case 0x03 :
            {
                skip(stream, 3* numVertices);
                break;
            }
            case 0x04 :
            {
                int numVertices;
                stream >> discard >> numVertices;
                skip(stream, numVertices*2);
                break;
            }
            case 0x17 :
            {
                skip(stream, 2);
                break;
            }
            case 0x0d :
            {
                stream >> discard;
                char str[16];
                stream.readRawData(str, 16);
                deps << QString(str);
                break;
            }
            case 0x1d :
            {
                int numTextures;
                char texName[32];
                stream >> discard >> numTextures;
                skip(stream, 4);
                for(int i = 0; i< numTextures; i++) {
                    stream.readRawData(texName, 32);
                    deps << QString(texName);
                }
                break;
            }
            case 0x0a :
            {
                stream >> discard;
                break;
            }
            case 0x05: case 0x06: case 0x0e: case 0x11:
            case 0x18: case 0x29: case 0x33: case 0x34:
            {
                int numVertices;
                stream >> numVertices;
                skip(stream, 4 + numVertices*3);
                break;
            }
            case 0x0f: case 0x19:
            {
                int numVertices;
                stream >> numVertices;
                skip(stream, 4 + numVertices);
                break;
            }
            case 0x1f:
            {
                int numVertices;
                stream >> discard >> numVertices;
                skip(stream, numVertices);
                break;
            }
            default:
            {
                std::cout << "Reached an unknown section " << std::hex
                          << blockNumber << std::endl;
                return;
            }
        }
    } while(blockNumber != 0x0) ;
}


void BinFile::skip(QDataStream &stream, int n)
{
    int discard;
    for(int i = 0; i < n ; i++)
        stream >> discard;
}
