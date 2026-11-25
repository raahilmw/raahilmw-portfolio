"""Render the product plates and the 72-view turntable with Blender 4.x and Pillow.

    blender -b -t 4 --python scripts/render-flipper.py
"""
from pathlib import Path
from math import cos, sin, pi, radians
from tempfile import TemporaryDirectory
import random

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / 'dist/assets/flipper'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
parts = {key: [] for key in ('base', 'board', 'display', 'shell')}
part = 'base'


def material(name, color, rough=.45, metal=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    node = m.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Roughness'].default_value = rough
    node.inputs['Metallic'].default_value = metal
    return m


housing = material('Frost-blue ABS', (.34, .51, .83), .32)
inside = material('Interior blue ABS', (.18, .30, .53), .48)
control = material('Indigo controls', (.052, .105, .40), .35)
groove = material('Button grooves', (.015, .036, .12), .38)
ink = material('Midnight blueprint ink', (.017, .041, .147), .43)
plastic = material('Blue-black gasket', (.015, .023, .051), .47)
glass = material('Backlit blue LCD', (.17, .44, .84), .40)
pixel_ink = material('LCD pixels', (.003, .011, .045), .63)
board_mask = material('Slate-blue solder mask', (.034, .103, .190), .36)
traces = material('Board tracks', (.121, .274, .385), .38)
gold = material('Plated contacts', (.70, .42, .105), .28, .55)
tin = material('Solder', (.54, .59, .59), .26, .65)
silicon = material('Molded IC', (.039, .043, .05), .55)
silk = material('Silkscreen', (.56, .68, .77), .52)
satin = material('Shield', (.29, .36, .44), .31, .56)
port = material('Port interior', (.014, .017, .02), .50)
for m in (glass,pixel_ink,control):
    m.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.14
flex = material('Polyimide', (.67, .26, .025), .42)
rubber = material('Switch surround', (.018, .037, .105), .51)


def mesh(name, vertices, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    parts[part].append(obj)
    return obj


def rounded(w, h, r, n=11):
    result = []
    for x, y, a in ((w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),
                    (-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)):
        for i in range(n+1):
            theta = radians(a + 90*i/n)
            result.append((x+r*cos(theta), y+r*sin(theta)))
    return result


def loft(name, sections, mat, offset=(0,0)):
    vertices, faces = [], []
    for z, w, h, rad in sections:
        vertices += [(x+offset[0],y+offset[1],z) for x,y in rounded(w,h,rad)]
    n = len(vertices)//len(sections)
    faces.append(tuple(reversed(range(n))))
    for k in range(len(sections)-1):
        for i in range(n):
            j=(i+1)%n
            faces.append((k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i))
    faces.append(tuple(range(len(vertices)-n,len(vertices))))
    return mesh(name,vertices,faces,mat)


def cut(obj, cutter):
    bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new('cut opening','BOOLEAN')
    mod.operation='DIFFERENCE'
    mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name)
    parts[part].remove(cutter)
    bpy.data.objects.remove(cutter,do_unlink=True)


def bevel(obj, width, segments=3):
    if obj.name.startswith(('Lower enclosure','Upper enclosure','Directional','OK button','Back button')):
        for poly in obj.data.polygons:
            poly.use_smooth=True
    if width:
        mod=obj.modifiers.new('edge radius','BEVEL')
        mod.width=width
        mod.segments=segments
        mod.harden_normals=True
    mod=obj.modifiers.new('face normals','WEIGHTED_NORMAL')
    mod.keep_sharp=True
    return obj


def rect(name,x,y,z,w,h,t,r,mat,b=.008):
    return bevel(loft(name,[(z-t/2,w,h,r),(z+t/2,w,h,r)],mat,(x,y)),b)


def cyl(name,x,y,z,r,h,mat,b=.008,vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h,location=(x,y,z))
    obj=bpy.context.object
    obj.name=name
    parts[part].append(obj)
    obj.data.materials.append(mat)
    return bevel(obj,b)


def line(name, coords, radius, mat):
    data=bpy.data.curves.new(name,'CURVE')
    data.dimensions='3D'
    data.resolution_u=1
    data.bevel_depth=radius
    data.bevel_resolution=1
    s=data.splines.new('POLY')
    s.points.add(len(coords)-1)
    for p,c in zip(s.points,coords): p.co=(*c,1)
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    data.materials.append(mat)
    parts[part].append(obj)
    return obj


def lettering(value, loc, size, mat, front=False, regular=False):
    data=bpy.data.curves.new(value,'FONT')
    data.body=value
    data.size=size
    data.align_x='CENTER'
    data.align_y='CENTER'
    data.space_character=1.12
    face='DejaVuSansMono.ttf' if regular else 'DejaVuSans-BoldOblique.ttf'
    font_path = Path('/usr/share/fonts/truetype/dejavu') / face
    if font_path.is_file():
        data.font = bpy.data.fonts.load(str(font_path), check_existing=True)
    obj=bpy.data.objects.new(value,data)
    scene.collection.objects.link(obj)
    obj.location=loc
    if front:obj.rotation_euler.x=pi/2
    data.materials.append(mat)
    parts[part].append(obj)
    return obj


# Bottom tray has a visible interior, wall thickness, screw bosses and moulding ribs.
outer=loft('Lower enclosure', [(-.51,5.48,2.30,.35),(-.46,5.64,2.46,.37),
    (-.33,5.85,2.60,.38),(-.18,5.97,2.68,.40),(.185,5.97,2.68,.40)],housing)
cut(outer,loft('Inside opening',[(-.342,5.59,2.31,.29),(.5,5.68,2.40,.31)],inside))
bevel(outer,.027)
rect('Tray floor',0,0,-.337,5.52,2.24,.017,.28,inside,.006)
for x in (-2.47,2.47):
    for y in (-.88,.88):
        cyl('Screw post',x,y,-.196,.13,.31,inside)
        cyl('Screw well',x,y,-.034,.055,.008,port,.002)
for x in (-1.75,-1.36,1.47,1.84):
    rect('Moulded rib',x,0,-.306,.046,1.92,.094,.016,inside)
for x in (-2.63,2.63):
    rect('Floor clip',x,0,-.23,.12,.60,.22,.033,inside)
# Product marking sits on the vertical front face of the housing.
lettering('FLIPPER',(-.38,-1.344,.001),.48,ink,front=True)
rect('Small port recess',1.99,-1.345,-.048,.60,.017,.095,.007,port,.004)
rect('Small port edge',1.99,-1.358,-.014,.45,.014,.015,.005,tin,.001)
rect('Side indicator',1.50,-1.35,-.039,.105,.016,.064,.006,inside,.003)

# Flat illustrative PCB with an intentionally simplified component layout.
part='board'
pcb=rect('Main board',0,0,.233,5.54,2.24,.105,.30,board_mask,.024)
random.seed(43)
for side in (-1,1):
    for i in range(15):
        x=-2.13+i*.29
        y=side*(.81+.055*(i%3))
        xx=x+random.choice((-.16,.16))
        line('Signal trace',[(x,y,.290),(x,y-side*.14,.290),
             (xx,y-side*.30,.290),(xx,side*.22,.290)],.009,traces)
        cyl('Copper via',x,y,.292,.028,.008,gold,.002,16)
for x in (-2.43,2.43):
    for y in (-.86,.86):
        cyl('Mounting pad',x,y,.294,.098,.013,gold,.003)
        cyl('Mounting recess',x,y,.303,.049,.007,plastic,.002)
rect('Main processor',-.45,-.02,.336,.80,.76,.10,.055,silicon)
for n in range(12):
    a=(n-5.5)*.052
    for s in (-1,1):
        rect('IC pin',-.45+a,s*.412-.02,.302,.020,.086,.027,.005,tin,.003)
        rect('IC pin',-.45+s*.439,a-.02,.302,.09,.018,.027,.004,tin,.003)
cyl('Pin one',-.74,.23,.388,.031,.006,inside,.001,18)
rect('Radio shield',1.23,.20,.358,1.13,.83,.12,.07,satin)
rect('Shield inset',1.23,.20,.422,.91,.59,.016,.055,tin)
for x,y,w,h in [(-1.8,.45,.53,.39),(-1.61,-.47,.59,.35),(.35,-.62,.48,.26),(1.46,-.59,.42,.31)]:
    rect('Peripheral IC',x,y,.331,w,h,.092,.039,silicon)
for x in (-2.03,-1.61,.28,.77,1.87):
    for i in range(3):
        y=-.35+i*.29
        rect('SMD capacitor',x,y,.316,.16,.082,.046,.014,tin)
        rect('Ceramic body',x,y,.342,.092,.085,.01,.014,inside)
lettering('FZ',(-2.21,.57,.293),.18,silk,regular=True)

# The LCD and the controls on the upper shell are separate visual layers.
part='display'
sx,sy=-.84,.11
rect('LCD carrier',sx,sy,.375,2.49,1.60,.105,.105,board_mask,.025)
rect('Black LCD surround',sx,sy,.500,2.34,1.49,.230,.115,plastic,.030)
rect('Backlit display',sx,sy,.617,2.191,1.344,.023,.064,glass,.010)
rect('Flex ribbon',-.45,-.80,.353,.62,.36,.025,.018,flex,.005)
for i in range(11):
    rect('Flex contact',-.68+i*.045,-.88,.369,.016,.16,.005,.004,gold,.001)

# 1-bit LCD animation art. The glyph is deliberately pixelated at the screen's scale.
size=(112,59)
lcd=Image.new('1',size,0)
draw=ImageDraw.Draw(lcd)
outline=[(18,39),(23,36),(30,35),(33,30),(39,23),(46,19),(50,12),(50,8),
         (56,11),(59,16),(65,16),(72,18),(78,21),(85,25),(90,26),(92,28),
         (89,30),(81,30),(75,33),(69,35),(62,36),(57,37),(51,42),(44,43),
         (47,38),(48,35),(43,35),(37,37),(31,40),(26,43),(22,44),(23,41),
         (22,39),(18,41),(11,41),(15,38)]
draw.polygon(outline,fill=1)
draw.polygon([(26,38),(34,34),(41,26),(48,22),(54,20),(60,19),(67,19),
              (74,21),(80,25),(83,27),(89,28),(81,28),(75,30),(68,32),(60,33),
              (53,34),(48,39),(50,33),(45,32),(37,34),(30,38)],fill=0)
draw.line([(61,31),(68,31),(74,29),(82,28)],fill=1)
draw.polygon([(74,24),(76,24),(76,26),(74,26)],fill=1)
draw.line([(41,44),(35,46),(29,46)],fill=1)
draw.line([(51,46),(44,48)],fill=1)
# Small LCD status marks stay on screen while the housing lifts away.
for i in range(3):
    draw.rectangle((8+i*2,6-i,8+i*2,7),fill=1)
draw.rectangle((97,4,105,7),outline=1)
draw.line((106,5,106,6),fill=1)
draw.rectangle((99,5,103,6),fill=1)

px=.0184; py=.0196; pixel_z=.631
def lcd_point(x,y):
    return (sx+(x-size[0]/2)*px,sy-(y-size[1]/2)*py,pixel_z)
verts=[];faces=[]
for y in range(size[1]):
    for x in range(size[0]):
        if lcd.getpixel((x,y)):
            k=len(verts)
            verts.extend([lcd_point(x,y),lcd_point(x,y+.92),lcd_point(x+.92,y+.92),lcd_point(x+.92,y)])
            faces.append((k,k+1,k+2,k+3))
mesh('Dolphin pixels',verts,faces,pixel_ink)

part='shell'
lid=loft('Upper enclosure',[(.188,5.97,2.68,.40),(.23,5.975,2.69,.40),
     (.43,5.89,2.65,.41),(.54,5.74,2.54,.41),(.608,5.57,2.38,.39),(.631,5.44,2.26,.375)],housing)
cut(lid,loft('LCD aperture',[(.05,2.29,1.44,.120),(.58,2.29,1.44,.12),
     (.65,2.36,1.51,.14),(.9,2.36,1.51,.14)],housing,(sx,sy)))
bevel(lid,.020)
cx,cy=1.28,.20
cyl('D-pad recess',cx,cy,.637,.683,.045,inside,.024,96)
cyl('D-pad gasket',cx,cy,.652,.639,.047,rubber,.022,96)
cyl('Directional rocker',cx,cy,.699,.617,.115,control,.040,96)
cyl('OK groove',cx,cy,.755,.236,.022,groove,.010)
cyl('OK button',cx,cy,.772,.214,.052,control,.025)
for a in range(4):
    theta=a*pi/2; xx,yy=cos(theta),sin(theta)
    # Low profile chevrons rather than printed legends.
    p=[(cx+xx*.40-yy*.082,cy+yy*.40+xx*.082,.760),
       (cx+xx*.51,cy+yy*.51,.760),
       (cx+xx*.40+yy*.082,cy+yy*.40-xx*.082,.760)]
    line('Directional chevron',p,.014,groove)
cyl('Back recess',2.15,-.55,.641,.221,.043,inside,.021)
cyl('Back button',2.15,-.55,.680,.192,.076,control,.031)
line('Back icon',[(2.22,-.59,.721),(2.19,-.51,.721),(2.10,-.51,.721),
     (2.133,-.481,.721),(2.10,-.51,.721),(2.133,-.545,.721)],.011,groove)
cyl('Indicator lens',.517,-.64,.638,.037,.02,plastic,.008)

# Neutral product lighting remains registered across all exported states.
scene.world=bpy.data.worlds.new('Studio')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.80,.94,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.32

def light(name,loc,power,size,color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.shape='DISK'
    data.size=size
    data.color=color
    ob=bpy.data.objects.new(name,data)
    scene.collection.objects.link(ob)
    ob.location=loc
    ob.rotation_euler=(-ob.location).to_track_quat('-Z','Y').to_euler()

light('Large softbox',(-4,-5,8),700,5,(1,.94,.87))
light('Fill',(4,-2,4),240,5,(.76,.85,1))
light('Rim',(-2,5,4),820,4,(.89,.94,1))
cam=bpy.data.cameras.new('Orthographic product lens')
ob=bpy.data.objects.new('Camera',cam)
scene.collection.objects.link(ob)
ob.location=(3.6,-11.3,10.3)
ob.rotation_euler=(Vector((0,0,.055))-ob.location).to_track_quat('-Z','Y').to_euler()
cam.type='ORTHO'
cam.ortho_scale=7.18
scene.camera=ob
scene.render.engine='CYCLES'
scene.cycles.samples=32
scene.cycles.use_denoising=False
scene.cycles.max_bounces=4
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='Standard'
scene.view_settings.look='None'
scene.view_settings.exposure=-.65
bpy.context.view_layer.update()

def camera_pixel(point):
    uv=world_to_camera_view(scene,ob,Vector(point))
    return (round(uv.x*960,1),round((1-uv.y)*540,1))

with TemporaryDirectory() as temp:
    packed={}
    for variant in ('assembled','shell','display','board','base'):
        for k,objects in parts.items():
            for obj in objects: obj.hide_render=variant not in ('assembled',k)
        scene.render.filepath=str(Path(temp)/(variant+'.png'))
        bpy.ops.render.render(write_still=True)
        with Image.open(scene.render.filepath) as source:
            packed[variant]=source.convert('RGBA')
            packed[variant].save(OUT/(variant+'.webp'),quality=90,method=6)
        print('PART',variant,packed[variant].getchannel('A').getbbox(), flush=True)
    points=[camera_pixel(v) for v in (lcd_point(73.5,23.7),lcd_point(77.25,23.7),
                                    lcd_point(77.25,27.25),lcd_point(73.5,27.25))]
    # Only cover the small eye in the registered resting image during a blink.
    near=camera_pixel(lcd_point(72,26))
    sample=packed['assembled'].getpixel(tuple(round(v) for v in near))
    patch=Image.new('RGBA',(960,540))
    pd=ImageDraw.Draw(patch)
    pd.polygon(points,fill=sample)
    pd.line([camera_pixel(lcd_point(74,25.8)),camera_pixel(lcd_point(76.9,25.8))],fill=(29,46,84,255),width=2)
    patch.save(OUT/'blink.webp',lossless=True,method=6)
    # A registered, antialiased glass overlay for the first display power-up.
    off=Image.new('RGBA',(1920,1080))
    od=ImageDraw.Draw(off)
    rim=[camera_pixel((sx+x,sy+y,.632)) for x,y in rounded(2.17,1.32,.068)]
    od.polygon([(2*x,2*y) for x,y in rim],fill=(32,42,65,255))
    off.resize((960,540),Image.Resampling.LANCZOS).save(OUT/'screen-off.webp',lossless=True,method=6)
    for name,p in {'button':(cx,cy,.78),'screen':(sx,sy,.629),'board':(-1.9,-.52,.32),
                   'base':(2.45,-.70,-.1),'eye':lcd_point(75,25)}.items():
        print('ANCHOR',name,camera_pixel(p),flush=True)
    print('LCD corners',[camera_pixel((sx+x,sy+y,.63)) for x,y in [
        (-1.10,.672),(1.1,.672),(1.1,-.672),(-1.1,-.672)]], flush=True)

    # Turn the complete device under the same stationary lights and camera.
    # The 5:4 cell keeps profile angles inside the frame. The poster is the
    # central 480×270 region of frame zero, with 57 px headroom on either side.
    cell_w, cell_h, columns, rows = 480, 384, 9, 8
    atlas = Image.new('RGBA', (cell_w*columns, cell_h*rows))
    tabletop = bpy.data.objects.new('Turntable', None)
    scene.collection.objects.link(tabletop)
    for objects in parts.values():
        for component in objects:
            component.hide_render = False
            component.parent = tabletop
    scene.cycles.samples = 18
    scene.render.resolution_x = cell_w
    scene.render.resolution_y = cell_h
    scene.render.filepath = str(Path(temp)/'turntable-frame.png')
    for frame in range(columns*rows):
        tabletop.rotation_euler.z = 2*pi*frame/(columns*rows)
        bpy.ops.render.render(write_still=True)
        with Image.open(scene.render.filepath) as raw:
            tile = raw.convert('RGBA')
        bounds = tile.getchannel('A').getbbox()
        if not bounds or min(bounds[:2]) < 2 or bounds[2] > cell_w-2 or bounds[3] > cell_h-2:
            raise RuntimeError(f'Clipped turntable frame {frame}: {bounds}')
        atlas.paste(tile, ((frame%columns)*cell_w, (frame//columns)*cell_h))
    atlas.save(OUT/'turntable.webp', quality=77, method=6)
