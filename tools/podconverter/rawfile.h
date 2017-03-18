#ifndef RAWFILE_H
#define RAWFILE_H

#include <podfile.h>
#include <podarchive.h>

class RawFile : PodFile
{
public:
    RawFile(PodArchive& arch, QString path);
};

#endif // RAWFILE_H
