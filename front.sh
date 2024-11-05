#!/bin/bash

function front_to_remote(){
    base_path="/e/project/dust_responsive/"

    # 对项目打包
    cd $base_path
    npm run build --mode=production

    # 删除上次的压缩包
    front_tar=$base_path"dust_front.tar"
    if [[ -e  $front_tar ]];then
        rm -f $front_tar
        echo "已删除 $front_tar"
    fi
    docker build -t nizhenshi/dust_front $base_path
    docker save -o $front_tar nizhenshi/dust_front


    ROMOTE_USER="root"
    ROMOTE_HOST="117.72.109.0"
    LOCAL_FILE=$front_tar
    REMOTE_FILE="/root/user/dust/"
    scp $LOCAL_FILE $ROMOTE_USER@$ROMOTE_HOST:$REMOTE_FILE
    if [[ $? -eq 0 ]];then
        echo "传输成功 $LOCAL_FILE"
    else
        echo "传输失败"
    fi
    if [[ -e  $front_tar ]];then
        rm -f $front_tar
        echo "已删除 $front_tar"
    fi
}
