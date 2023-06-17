import { Text } from '@rneui/themed';
import React from 'react';
import { ImageStyle, PixelRatio, StyleProp, ViewStyle } from 'react-native';
import { Image } from '@rneui/themed';

interface GoogleStaticMapsProps {
  center: string | Location;
  zoom: number;
  size: Size;
  scale?: 1 | 2;
  format?: 'png' | 'png32' | 'gif' | 'jpg' | 'jpg-baseline';
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  language?: string;
  region?: string;
  apiKey: string;
  signature?: string;
  onError: Function;
  onLoad: Function;
  blur?: number;
  mapID?: string;
  mapStyle?: Array<MapStyle>;
  paths?: Array<Path>;
  markers?: Array<Marker>;
  visible?: Array<string>;
  containerStyle?: StyleProp<ViewStyle>;
  enableImplicitPositioning?: boolean;
}

interface Location {
  latitude: string;
  longitude: string;
}

interface MapStyle {
  feature?: string;
  element?: string;
  elementStyle: Partial<ElementStyle>;
}

interface ElementStyle {
  hue: string;
  lightness: number;
  saturation: number;
  gamma: number;
  invertLightness: boolean;
  visibility: 'on' | 'off' | 'simplified';
  color: string;
  weight: number;
}

interface Size {
  width: number;
  height: number;
}

interface Path extends Color {
  points: Array<string> | Array<Location>;
  weigth?: number;
  fillColor?: string;
  geodesic?: boolean;
}

interface Marker extends Color {
  location: string | Location;
  size?: 'tiny' | 'mid' | 'small' | 'normal';
  label?: string;
  scale?: 1 | 2 | 4;
}

interface Color {
  color?:
    | string
    | 'black'
    | 'brown'
    | 'green'
    | 'purple'
    | 'yellow'
    | 'blue'
    | 'gray'
    | 'orange'
    | 'red'
    | 'white';
}

const defaultScale = () => {
  let isRetina = PixelRatio.get() >= 2;
  return isRetina ? 2 : 1;
};

const setLocations = (items: Array<string> | Array<Location>) => {
  return items
    .map(item =>
      typeof item === 'string' ? item : `${item.latitude},${item.longitude}`,
    )
    .join('|');
};

const GoogleStaticMaps = ({
  center,
  zoom = 12,
  size,
  scale = defaultScale(),
  format = 'png',
  mapType = 'roadmap',
  language,
  region,
  mapID,
  mapStyle,
  apiKey,
  blur = 0,
  paths,
  markers,
  visible,
  enableImplicitPositioning = false,
  containerStyle,
  signature,
  onError = () => {},
  onLoad = () => {},
}: GoogleStaticMapsProps) => {
  const root = 'https://maps.googleapis.com/maps/api/staticmap';

  const getStaticMapUrl = () => {
    let uri = new URL(root);
    let params = new URLSearchParams();

    // Center
    if (!enableImplicitPositioning) {
      typeof center === 'string'
        ? params.append('center', center)
        : params.append('center', `${center.latitude},${center.longitude}`);
    } else if (!(markers || paths || visible)) {
      console.error(
        'If enableImplicitPositioning=true, add either a marker, path or visible',
      );
    }

    //Zoom
    params.append('zoom', `${zoom}`);

    //Scale
    params.append('scale', scale.toString());

    //size
    let { width, height } = size;
    params.append('size', `${width}x${height}`);

    // MapType
    params.append('maptype', mapType);

    // format
    params.append('format', format);

    // Language
    language ? params.append('language', language) : null;

    // Region
    region ? params.append('region', region) : null;

    // Map Style
    mapID
      ? params.append('map_id', mapID)
      : mapStyle && mapStyle.length === 0
      ? params.append('', '')
      : null;

    // path=pathStyles|pathLocation1|pathLocation2|...
    // Path
    if (paths) {
      paths.forEach(path => {
        let styleUri = '';
        path.color ? (styleUri += `color:${path.color}|`) : '';
        path.fillColor ? (styleUri += `fillcolor:${path.fillColor}|`) : '';
        path.geodesic ? (styleUri += `geodesic:${path.geodesic}|`) : '';
        path.weigth ? (styleUri += `weight:${path.weigth}|`) : '';

        params.append('path', `${styleUri}${setLocations(path.points)}`);
      });
    }

    // Marker
    if (markers) {
      markers.forEach(marker => {
        let styleUri = '';

        marker.color ? (styleUri += `color:${marker.color}|`) : '';
        marker.label
          ? (styleUri += `label:${marker.label.charAt(0).toUpperCase()}|`)
          : '';

        marker.size ? (styleUri += `size:${marker.size}|`) : '';

        marker.scale ? (styleUri += `scale:${marker.scale}|`) : '';

        let locationUri =
          typeof marker.location === 'string'
            ? marker.location
            : `${marker.location.latitude},${marker.location.longitude}`;

        params.append('markers', `${styleUri}${locationUri}`);
      });
    }

    // Visible
    visible ? params.append('visible', visible.join('|')) : null;

    // API
    params.append('key', apiKey);

    uri.search = params.toString();

    console.log(`uri-href:: ${uri.href}`);

    return uri.href;
  };

  return (
    <>
      <Image
        containerStyle={containerStyle}
        source={{
          uri: getStaticMapUrl(),
        }}
        blurRadius={blur}
      />
    </>
  );
};

export default GoogleStaticMaps;

// Todo - Map Style
// Todo - Custom Marker Icons
// Todo - Image Loading and error handling
