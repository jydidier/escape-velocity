#include <stdio.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <string.h>
#include <unistd.h>

typedef struct {
    unsigned int numfiles;
    char id[80];
} header;

typedef struct {
    char filepath[32];
    unsigned int filesize;
    unsigned int fileoffset;
} file_entry;


int check_file_exists(char* filename) {
    FILE* file_check = fopen(filename, "r");
    if (file_check != NULL) {
        fclose(file_check);
        return 1;
    }
    return 0;
}

FILE* create_file(char* filepath) {        
    char* path_part = strtok(filepath,"\\");
    if (!check_file_exists(path_part)) {
        mkdir(path_part, S_IRWXU);
    }
    
    filepath[strlen(path_part)] = '/';
    
    // récrire le chemin à cause du séparateur
    return fopen(filepath,"w");    
}


void extract_file(FILE* pod_file,file_entry fe) {
    FILE* file_to_write = create_file(fe.filepath);
    
    if (file_to_write == NULL) 
        return;
    
    char buffer[fe.filesize];
    
    fseek(pod_file, fe.fileoffset , SEEK_SET);
    
    fread(buffer, 1, fe.filesize, pod_file);
    fwrite(buffer, 1, fe.filesize, file_to_write);
    fclose(file_to_write);
    
}




int main() {
    FILE* file = fopen("startup.pod", "r");
    
    if (file == NULL) 
        return 1;
    
    header h;
    
    fread(&h, 1, sizeof(header), file);
    
    printf("records: %i\n", h.numfiles);
    
    file_entry entries[h.numfiles];
    
    fread(entries, h.numfiles, sizeof(file_entry), file);
    
    for (int i=0; i<h.numfiles ; i++) {
        printf("entry : %s\n", entries[i].filepath);
        extract_file(file,entries[i]);
    }
    fclose(file);
    
    FILE* toto = fopen("toto","r");
    if (toto != NULL) {
        printf("can open directories as files\n");
        fclose(toto);
    }
    
    return 0;
}